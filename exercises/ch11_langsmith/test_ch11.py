from kit import ai, call


def test_find_first_sql(ex):
    """11.1 从消息里找到第一次执行的 SQL"""
    msgs = [
        ai("let me think"),
        call("other_tool", {"x": 1}),
        call("execute_sql", {"query": "SELECT 1"}),
        call("execute_sql", {"query": "SELECT 2"}),
    ]
    assert ex.find_first_sql(msgs) == "SELECT 1"
    assert ex.find_first_sql([ai("no tools")]) is None


def test_dataset(ex):
    """11.2 数据集有 5 条格式正确的样本"""
    assert len(ex.DATASET) == 5, "要正好 5 条样本"
    for item in ex.DATASET:
        assert isinstance(item["inputs"]["question"], str) and item["inputs"]["question"]
        assert isinstance(item["outputs"]["answer"], str) and item["outputs"]["answer"]


def test_correct(ex):
    """11.3 评估器：忽略大小写和空白"""
    assert ex.correct({"answer": "The answer is AC/DC."}, {"answer": " ac/dc "}) is True
    assert ex.correct({"answer": "I don't know"}, {"answer": "3"}) is False


def test_run_experiment(ex):
    """11.4 本地实验能算出平均分并区分好坏"""
    dataset = [
        {"inputs": {"question": "1+1"}, "outputs": {"answer": "2"}},
        {"inputs": {"question": "2+2"}, "outputs": {"answer": "4"}},
    ]

    def half_right(inputs):
        return {"answer": "2"}

    def not_empty(outputs, reference_outputs):
        return bool(outputs["answer"])

    report = ex.run_experiment(half_right, dataset, [ex.correct, not_empty])
    assert report["scores"] == {"correct": 0.5, "not_empty": 1.0}
    assert report["results"] == [{"correct": 1.0, "not_empty": 1.0}, {"correct": 0.0, "not_empty": 1.0}]
